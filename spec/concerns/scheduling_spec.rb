require 'rails_helper'
require 'priority_queue'
include Scheduling
include Const

RSpec.describe Scheduling, :type => :concern do

  # "Seed" DB with 2 visualisations, one being default
  Visualisation.create([
    {:name => "Pink", 
     :approved => true,
     :vis_type => :vis,
     :content_type => :file,
     :link => "/assets/images/dummy/pink.png",
     :screenshot => File.open("app/assets/images/dummy/pink.png"),
     :description => "Lorem ipsum dolor sit amet, consectetur adipiscing"}, 
    {:name => "Power", 
     :approved => true,
     :vis_type => :advert,
     :content_type => :file,
     :isDefault => true,
     :link => "/assets/images/dummy/power.png",
     :screenshot => File.open("app/assets/images/dummy/power.png"),
     :description => "Lorem ipsum dolor sit amet, consectetur adipiscing"}, 
  ])

  def getVis(min_playtime = Const.SECONDS_IN_UNIT_TIME)
    return Visualisation.create(
      {:name => "pink" + rand(10).to_s,
       :approved => true,
       :vis_type => :vis,
       :content_type => :file,
       :link => "/assets/dummy/pink.png",
       :description => "Lorem ipsum dolor sit amet, consectetur adipiscing",
       :screenshot => File.open("app/assets/images/dummy/pink.png"),
       :min_playtime => min_playtime}
    )
  end

  describe '.init_default_programmes' do

    start_t = DateTime.new(2014, 9, 1, 12, 0, 0).utc
    end_t = DateTime.new(2014, 9, 1, 13, 0, 0).utc

    it 'should return programmes, each containing default visualisation' do
      timeslot = Timeslot.create({:start_time => start_t,
                                  :end_time => end_t})
      progs = init_default_programmes(timeslot)

      progs.each do |prog|
        vis = Visualisation.find(prog.visualisation_id)
        expect(vis.isDefault).to be true
      end
    end

    it 'should return programmes with lowest priority & no. of screens(s)' do
      timeslot = Timeslot.create({:start_time => start_t,
                                  :end_time => end_t})
      progs = init_default_programmes(timeslot)

      progs.each do |prog|
        expect(prog.priority).to eq(Const.MIN_PRIORITY)
        expect(prog.screens).to eq(Const.MIN_NO_SCREENS)
      end
    end
  end

  describe '.clean_old_sessions' do
    it 'should clean all the existing session within the timeslot' do
      for i in 0..rand(59)
        PlayoutSession.create(
          {:start_time => DateTime.new(2014, 9, 1, 12, i, 0).utc,
           :end_time => DateTime.new(2014, 9, 1, 12, i+1, 0).utc})
      end

      start_time = DateTime.new(2014, 9, 1, 12, 0, 0).utc
      end_time = DateTime.new(2014, 9, 1, 13, 0, 0).utc
      timeslot = Timeslot.create({:start_time => start_time,
                                  :end_time => end_time})

      clean_old_sessions(timeslot)

      sessions = PlayoutSession.where(start_time: start_time...end_time)
      expect(sessions.length).to be 0
    end
  end

  describe '.generate_schedule' do
    start_t = DateTime.new(2014, 9, 2, 12, 0, 0).utc
    end_t = DateTime.new(2014, 9, 2, 13, 0, 0).utc

    def getVis(min_playtime = Const.SECONDS_IN_UNIT_TIME)
      return Visualisation.create(
       {:name => "pink" + rand(10).to_s,
        :approved => true,
        :vis_type => :vis,
        :content_type => :file,
        :link => "/assets/dummy/pink.png",
        :description => "Lorem ipsum dolor sit amet, consectetur adipiscing",
        :screenshot => File.open("app/assets/images/dummy/pink.png"),
        :min_playtime => min_playtime}
      )
    end

    context 'schedule playout with time directly proportional to priority' do
      
      def getTotalPlayoutTime(summary)
        total_playout_time = 0
        summary.each do |summary_item|
          if (!Visualisation.find(summary_item.visualisation_id).isDefault)
            total_playout_time += summary_item.vis_playout_time
          end
        end
        return total_playout_time
      end

      def getTotalPriority(summary)
        total_priority = 0
        summary.each do |summary_item|
          if (!Visualisation.find(summary_item.visualisation_id).isDefault)
            total_priority += summary_item.priority
          end
        end
        return total_priority
      end

      def checkPlaytime(summary, prog_ids)
        prog_ids.each do |prog_id|
          target = summary.find{|item| item.programme_id == prog_id}
          expected_playtime = target.priority/getTotalPriority(summary).to_f *
                              getTotalPlayoutTime(summary)

          expect(target.vis_playout_time).
            to be_within(Const.MAX_PLAYOUT_TIME_ERROR * expected_playtime).
            of (expected_playtime)
        end
      end

      it 'for one programme (overriding case)' do
        prog = Programme.create({:screens => 4, :priority => 1})
        prog.visualisation = getVis

        timeslot = Timeslot.create({:start_time => start_t, :end_time => end_t})
        timeslot.programmes << prog
        generate_schedule(timeslot)

        summary = getSummary(timeslot)
        checkPlaytime(summary, [prog.id])
      end

      context 'for more than one programme under low load:' do
        it 'Example 1 (eq priority, same screen utilisation)' do
          priority = rand(10) + 1
          screens = rand(4) + 1

          prog1 = Programme.create({:screens => screens, :priority => priority})
          prog1.visualisation = getVis
          prog2 = Programme.create({:screens => screens, :priority => priority})
          prog2.visualisation = getVis
          prog3 = Programme.create({:screens => screens, :priority => priority})
          prog3.visualisation = getVis

          timeslot = Timeslot.create({:start_time => start_t, :end_time => end_t})
          timeslot.programmes << [prog1, prog2, prog3]
          generate_schedule(timeslot)

          summary = getSummary(timeslot)
          checkPlaytime(summary, [prog1.id, prog2.id, prog3.id])
        end

        it 'Example 2 (eq priority, differing screen utilisation)' do
          priority = rand(10) + 1

          prog1 = Programme.create({:screens => (rand(4) + 1), :priority => priority})
          prog1.visualisation = getVis
          prog2 = Programme.create({:screens => (rand(4) + 1), :priority => priority})
          prog2.visualisation = getVis
          prog3 = Programme.create({:screens => (rand(4) + 1), :priority => priority})
          prog3.visualisation = getVis

          timeslot = Timeslot.create({:start_time => start_t, :end_time => end_t})
          timeslot.programmes << [prog1, prog2, prog3]
          generate_schedule(timeslot)

          summary = getSummary(timeslot)
          checkPlaytime(summary, [prog1.id, prog2.id, prog3.id])
        end

        it 'Example 3 (eq priority, differing screen utilisation, differing
            vis\' min_playtime) - expect to get 1/3 playtime as well' do
          priority = rand(10) + 1

          prog1 = Programme.create({:screens => (rand(4) + 1), :priority => priority})
          prog1.visualisation = getVis
          prog2 = Programme.create({:screens => (rand(4) + 1), :priority => priority})
          prog2.visualisation = getVis(2 * Const.SECONDS_IN_UNIT_TIME)
          prog3 = Programme.create({:screens => (rand(4) + 1), :priority => priority})
          prog3.visualisation = getVis(3 * Const.SECONDS_IN_UNIT_TIME)

          timeslot = Timeslot.create({:start_time => start_t, :end_time => end_t})
          timeslot.programmes << [prog1, prog2, prog3]
          generate_schedule(timeslot)

          summary = getSummary(timeslot)
          checkPlaytime(summary, [prog1.id, prog2.id, prog3.id])
        end

        it 'Example 4 (skewed priority, same screen utilisation)' do
          screens = rand(4) + 1
          prog1 = Programme.create({:screens => 2, :priority => 1})
          prog1.visualisation = getVis
          prog2 = Programme.create({:screens => 2, :priority => 1})
          prog2.visualisation = getVis
          prog3 = Programme.create({:screens => 2, :priority => 10})
          prog3.visualisation = getVis

          timeslot = Timeslot.create({:start_time => start_t, :end_time => end_t})
          timeslot.programmes << [prog1, prog2, prog3]
          generate_schedule(timeslot)

          summary = getSummary(timeslot)
          checkPlaytime(summary, [prog1.id, prog2.id, prog3.id])
        end

        it 'Example 5 (skewed priority, differing screen utilisation)' do
          prog1 = Programme.create({:screens => (rand(4) + 1), :priority => 1})
          prog1.visualisation = getVis
          prog2 = Programme.create({:screens => (rand(4) + 1), :priority => 1})
          prog2.visualisation = getVis
          prog3 = Programme.create({:screens => (rand(4) + 1), :priority => 10})
          prog3.visualisation = getVis

          timeslot = Timeslot.create({:start_time => start_t, :end_time => end_t})
          timeslot.programmes << [prog1, prog2, prog3]
          generate_schedule(timeslot)

          summary = getSummary(timeslot)
          checkPlaytime(summary, [prog1.id, prog2.id, prog3.id])
        end

        it 'Example 6 (skewed priority, differing screen utilisation,
            reasonably high min_playtime in low priority vis)' do
          prog1 = Programme.create({:screens => (rand(4) + 1), :priority => 1})
          prog1.visualisation = getVis(300)
          prog2 = Programme.create({:screens => (rand(4) + 1), :priority => 1})
          prog2.visualisation = getVis
          prog3 = Programme.create({:screens => (rand(4) + 1), :priority => 10})
          prog3.visualisation = getVis

          timeslot = Timeslot.create({:start_time => start_t, :end_time => end_t})
          timeslot.programmes << [prog1, prog2, prog3]
          generate_schedule(timeslot)

          summary = getSummary(timeslot)
          checkPlaytime(summary, [prog1.id, prog2.id, prog3.id])
        end

        it 'Example 7 (differing priority, differing screen utilisation)' do
          prog1 = Programme.create({:screens => (rand(4) + 1), 
                                    :priority => (rand(10) + 1)})
          prog1.visualisation = getVis
          prog2 = Programme.create({:screens => (rand(4) + 1), 
                                    :priority => (rand(10) + 1)})
          prog2.visualisation = getVis
          prog3 = Programme.create({:screens => (rand(4) + 1), 
                                    :priority => (rand(10) + 1)})
          prog3.visualisation = getVis

          timeslot = Timeslot.create({:start_time => start_t, :end_time => end_t})
          timeslot.programmes << [prog1, prog2, prog3]
          generate_schedule(timeslot)

          summary = getSummary(timeslot)
          checkPlaytime(summary, [prog1.id, prog2.id, prog3.id])
        end
      end

      context 'for more than one programme under high load:' do
        it 'Example 1 (eq (low) priority, same screen utilisation)' do
          priority = rand(10) + 1
          screens = rand(2) + 1
          prog_ids = Array.new
          timeslot = Timeslot.create({:start_time => start_t, :end_time => end_t})

          for i in 0..rand(10) + 11
            prog = Programme.create({:screens => screens, :priority => priority})
            prog.visualisation = getVis
            timeslot.programmes << prog
            prog_ids << prog.id
          end
          
          generate_schedule(timeslot)
          summary = getSummary(timeslot)
          checkPlaytime(summary, prog_ids)
        end

        it 'Example 1 (eq (low) priority, same screen utilisation)' do
          priority = rand(10) + 1
          screens = rand(2) + 1
          prog_ids = Array.new
          timeslot = Timeslot.create({:start_time => start_t, :end_time => end_t})

          for i in 0..rand(10) + 21
            prog = Programme.create({:screens => screens, :priority => priority})
            prog.visualisation = getVis
            timeslot.programmes << prog
            prog_ids << prog.id
          end
          
          generate_schedule(timeslot)
          summary = getSummary(timeslot)
          checkPlaytime(summary, prog_ids)
        end
      end

    end  
    
    context 'should work for 2x2 screen configuration:' do
      it 'no 1x2 vis should be on screens in two seperate rows' do
        timeslot = Timeslot.create({:start_time => start_t, :end_time => end_t})

        exampleProg = Programme.create({:screens => 2, :priority => rand(10) + 1})
        exampleProg.visualisation = getVis
        timeslot.programmes << exampleProg

        for i in 0..3
          prog = Programme.create({:screens => rand(2) + 1, :priority => rand(10) + 1})
          prog.visualisation = getVis
          timeslot.programmes << prog
        end

        generate_schedule(timeslot, 2, 2)
        playouts = PlayoutSession.where(timeslot_id: timeslot.id).
                   where(visualisation_id: exampleProg.visualisation.id)

        playouts.each do |playout|
          expect(playout.start_screen.div(2)).to be playout.end_screen.div(2)

        end
      end
    end 
  end

  describe '.initQueue' do
    it 'initialise queue with increasing time for next playout' do
      start_t = DateTime.new(2014, 9, 3, 12, 0, 0).utc
      
      prog1 = Programme.create({:screens => 1, :priority => 1})
      prog1.visualisation = getVis
      prog2 = Programme.create({:screens => 1, :priority => 5})
      prog2.visualisation = getVis(2 * Const.SECONDS_IN_UNIT_TIME)
      prog3 = Programme.create({:screens => 1, :priority => 4})
      prog3.visualisation = getVis

      queue = initQueue([prog1, prog2, prog3], 1, 4, start_t)
      expect(queue.min.first.prog).to be prog3
      expect(queue.delete_min.first.prog).to be prog3
      expect(queue.delete_min.first.prog).to be prog2
      expect(queue.delete_min.first.prog).to be prog1
    end
  end

end


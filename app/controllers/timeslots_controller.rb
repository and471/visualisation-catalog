class TimeslotsController < ApplicationController
  include Scheduling
  require 'date'



  # POST /timeslots/copy_from_last_week
  def copy_from_last_week
    current_day = DateTime.iso8601(params[:startOfDay])
    last_week_day = current_day - 7

    @new_timeslots = []

    ts_last = Timeslot.where("start_time >= ? AND end_time < ?", last_week_day, last_week_day + 24.hours)
    ts_last.each do |ts|
      new_timeslot = ts.dup
      new_timeslot.start_date += 7
      new_timeslot.end += 7
      new_timeslot.save!
      @new_timeslots.push(new_timeslot)
    end

  end

  # GET /timeslots
  def index
    if params[:weekStarting] != nil
      @timeslots = get_weeks_timeslots(params[:weekStarting])
      return
    end

    if params[:startOfDay] != nil
      dt = DateTime.iso8601(params[:startOfDay])
      @timeslots = Timeslot.where("start_time >= ? AND end_time < ?", dt, dt.advance(:hours => 24))
    else
      @timeslots = Timeslot.all
    end
  end

	# GET /timeslots/1
  # GET /timeslots/1.json
  def show
    @timeslot = Timeslot.find_by_id(params[:id])
  end

  # GET /timeslots/new
  def new
    @timeslot = Timeslot.new
  end

  # GET /timeslots/1/edit
  def edit
  end

  # POST /timeslots
  # POST /timeslots.json
  def create
    pars = timeslot_params
    @timeslot = Timeslot.new(pars)

    respond_to do |format|
      if @timeslot.save
        format.html { redirect_to @timeslot, notice: 'timeslot was successfully created.' }
        format.json { render :show, status: :created, location: @timeslot }
      else
        format.html { render :new }
        format.json { render json: @timeslot.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /timeslots/1
  # PATCH/PUT /timeslots/1.json
  def update
    respond_to do |format|
      if @timeslot.update(timeslot_params)
        generate_schedule(@timeslot)
        format.html { redirect_to @timeslot, notice: 'timeslot was successfully updated.' }
        format.json { render :show, status: :ok, location: @timeslot }
      else
        format.html { render :edit }
        format.json { render json: @timeslot.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /timeslots/1
  # DELETE /timeslots/1.json
  def destroy
    t = Timeslot.find_by_id(params[:id])
    t.destroy if t != nil

    respond_to do |format|
      format.html { redirect_to timeslots_url, notice: 'Timeslot was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  def test
    start_time = DateTime.new(2014, 11, 19, 12, 0, 0).utc
    end_time = DateTime.new(2014, 11, 19, 13, 0, 0).utc

    vis1 = Visualisation.create({:name => "Milan"})
    vis2 = Visualisation.create({:name => "Green", :min_playtime => 120})
    vis3 = Visualisation.create({:name => "Pink", :min_playtime => 180})

    prog1 = Programme.create({:screens => 2, :priority => 3})
    vis1.programmes << prog1
    prog2 = Programme.create({:screens => 1, :priority => 6})
    vis2.programmes << prog2
    prog3 = Programme.create({:screens => 1, :priority => 9})
    vis3.programmes << prog3
    
    timeslot = Timeslot.create({:start_time => start_time,
                                :end_time => end_time})
    timeslot.programmes << [prog1, prog2, prog3]
    
    generate_schedule(timeslot)

    @test = PlayoutSession.where(start_time: start_time...end_time)
    @start_time = start_time
    @end_time = end_time
    @count = PlayoutSession.count

  end

  private
    # Never trust parameters from the scary internet, only allow the white list through.
    def timeslot_params
      params[:timeslot].permit(:start_time, :end_time)
    end

end

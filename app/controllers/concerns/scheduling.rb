# Module for generating schedule
# Use of concerns: http://richonrails.com/articles/rails-4-code-concerns-in-active-record-models

module Scheduling
  extend ActiveSupport::Concern
 
  def testing
    @test = 1
  end

  def get_a_default_programme
    vis = Visualisation.where(isDefault:true)

    prog = Programme.new({:visualisations_id => vis[rand(vis.length())].id,
                          :screens => Const.MIN_SCREENS,
                          :priority => Const.MIN_PRIORITY
                         })
    return prog
  end

  def get_total_screen_load(programmes)
    scrLoad = 0

    programmes.each do |programme|
      scrLoad = scrLoad + programme.screens
    end
    return scrLoad
  end

  def preprocess_and_build_queue(programmes)
    return []  
  end
end

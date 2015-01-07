class PlayoutSessionsController < ApplicationController
  require 'date'


  # GET /playout_sessions/info
  def get_info
  	now = DateTime.now
  	@sessions = PlayoutSession.where("start_time <= ? AND end_time >= ? ", now, now)
  end

  #Don't need params or create actions here,
  #PlayoutSessions are only created in the scheduling
  #algorithm(tm)
end

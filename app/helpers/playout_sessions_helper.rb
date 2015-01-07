module PlayoutSessionsHelper
require 'date'

  def remove_old_sessions
    now = DateTime.now

    PlayoutSession.where("end_time < ?", now).delete_all
  end
end

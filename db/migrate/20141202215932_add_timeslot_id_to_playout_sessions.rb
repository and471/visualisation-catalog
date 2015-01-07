class AddTimeslotIdToPlayoutSessions < ActiveRecord::Migration
  def change
    add_column :playout_sessions, :timeslot_id, :integer
  end
end

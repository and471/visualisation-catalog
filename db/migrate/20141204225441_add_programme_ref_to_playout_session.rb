class AddProgrammeRefToPlayoutSession < ActiveRecord::Migration
  def change
    add_reference :playout_sessions, :programme, index: true
  end
end

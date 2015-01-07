class RemoveDateFromTimeslots < ActiveRecord::Migration
  def change
    remove_column :timeslots, :date
  end
end

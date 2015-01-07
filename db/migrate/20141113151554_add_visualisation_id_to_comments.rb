class AddVisualisationIdToComments < ActiveRecord::Migration
  def change
  	add_column :comments, :visualisation_id, :integer
  end
end

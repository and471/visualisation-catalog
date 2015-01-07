class AddVisTypeToVisualisation < ActiveRecord::Migration
  def change
  	add_column :visualisations, :vis_type, :integer
  end
end

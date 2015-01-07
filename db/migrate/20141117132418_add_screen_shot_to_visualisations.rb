class AddScreenShotToVisualisations < ActiveRecord::Migration
  def change
  	add_column :visualisations, :screenshot, :string
  end
end

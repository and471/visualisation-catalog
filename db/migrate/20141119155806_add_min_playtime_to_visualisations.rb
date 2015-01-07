class AddMinPlaytimeToVisualisations < ActiveRecord::Migration
  def change
      add_column :visualisations, :min_playtime, :integer
  end
end

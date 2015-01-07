class AddBgcolourToVisualisations < ActiveRecord::Migration
  def change
    add_column :visualisations, :bgcolour, :string
  end
end

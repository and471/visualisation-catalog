class AddVotesToVisualisations < ActiveRecord::Migration
  def change
    add_column :visualisations, :votes, :integer
  end
end

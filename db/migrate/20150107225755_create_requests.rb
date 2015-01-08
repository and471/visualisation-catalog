class CreateRequests < ActiveRecord::Migration
  def change
    create_table :requests do |t|
      t.string :name
      t.string :company
      t.string :email
      t.text :notes
      t.string :desired_username

      t.timestamps
    end
  end
end

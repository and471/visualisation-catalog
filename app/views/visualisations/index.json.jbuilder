json.array!(@visualisations) do |visualisation|
  json.extract! visualisation, :id, :name, :link, :description, :notes, :author_info, :updated_at, :created_at, :approved
end

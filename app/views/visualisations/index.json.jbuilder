json.array!(@visualisations) do |visualisation|
  json.id visualisation.id
  json.name visualisation.name
  json.link visualisation.link
  json.description visualisation.description
  json.notes visualisation.notes
  json.approved visualisation.approved
  json.vis_type visualisation.vis_type
  json.content visualisation.content.url
  json.screenshot visualisation.screenshot.url
  json.min_playtime visualisation.min_playtime
  json.content_type visualisation.content_type
  json.bgcolour visualisation.bgcolour
  json.votes visualisation.votes

  json.author do
    json.username visualisation.user.username
    json.avatar visualisation.user.avatar.url
  end
end


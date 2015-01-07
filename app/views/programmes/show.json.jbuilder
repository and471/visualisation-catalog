json.extract! @programme, :id, :screens, :priority, :timeslot_id

json.visualisation do
  json.merge! @programme.visualisation.attributes
  json.screenshot @programme.visualisation.screenshot.url
  json.vis_type @programme.visualisation.vis_type
  json.author do
    json.username @programme.visualisation.user.username
    json.avatar @programme.visualisation.user.avatar.url
  end
end

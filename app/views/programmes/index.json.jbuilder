json.array!(@programmes) do |p|
   json.extract! p, :id, :screens, :priority, :timeslot_id
   
   json.visualisation do
    json.merge! p.visualisation.attributes
    json.screenshot p.visualisation.screenshot.url
    json.vis_type p.visualisation.vis_type
    json.author do
      json.username p.visualisation.user.username
      json.avatar p.visualisation.user.avatar.url
    end
  end

end

json.array!(@users) do |u|
   json.username u.username
   json.isAdmin u.isAdmin
   json.isApproved u.isApproved
   json.id u.id
   json.avatar u.avatar.url
end

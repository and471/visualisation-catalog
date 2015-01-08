json.array!(@requests) do |request|
  	json.id request.id
	json.name request.name 
	json.company request.company
	json.email request.email
	json.notes request.notes 
	json.desired_username request.desired_username
	json.created_at request.created_at 

	json.user do
		json.id request.user.id
		json.avatar request.user.avatar.url
		json.username request.user.username
	end
end

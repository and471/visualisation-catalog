json.array!(@comments) do |comment|
  	json.id comment.id
	json.created_at comment.created_at
    json.content comment.content

	json.user do 
		json.username comment.user.username
		json.avatar comment.user.avatar.url
	end
end

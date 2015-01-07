json.id @comment.id
json.content @comment.content
json.created_at @comment.created_at
json.user do 
	json.username @comment.user.username
	json.avatar @comment.user.avatar.url
end

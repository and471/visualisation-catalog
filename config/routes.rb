Rails.application.routes.draw do #todo: delete this:)

  patch '/users/:userid/approve' => 'users#approve'

  delete '/users/:userid/reject' => 'users#reject'

  get 'timeslots/test'

  get '/visualisations/:visid/vote' => 'visualisations#vote'

  root to: 'visitors#index'
  devise_for :users, :token_authentication_key => 'authentication_key'

  get '/users/info' => 'users#info' #must be before resources users to avoid route clash

  resources :users

  post '/visualisations' => 'visualisations#create'

  patch '/visualisations/:visid/approve' => 'visualisations#approve'

  get '/users/:userid/makeadmin' => 'users#make_admin'
  
  delete '/visualisations/:visid/reject' => 'visualisations#reject'

  post '/timeslots/copy_from_last_week' => 'timeslots#copy_from_last_week'

  post '/tokens' => 'tokens#create'  

  get '/visualisations/current/:screennum' => 'visualisations#current'

  get '/playout_sessions/info' => 'playout_sessions#get_info'

  get '/visualisations/:visid/display' => 'visualisations#display'
  get '/visualisations/:visid/display_internal' => 'visualisations#display_internal'

  post '/users/register' => 'users#register'

  get '/timeslots/:id/get_summary' => 'timeslots#get_summary'

  resources :programmes
  resources :visualisations
  resources :timeslots
  resources :requests
  resources :comments


  get '/schedulingtest/' => 'timeslots#test'

end

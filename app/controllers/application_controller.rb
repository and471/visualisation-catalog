class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :null_session

  
# token stuff
  before_filter :after_token_authentication # it is empty hook provided by devise i,e 

  def after_token_authentication
    if params[:authentication_key].present?
      @user = User.find_by_authentication_token(params[:authentication_key]) # we are finding 
      sign_in @user if @user # we are siging in user if it exist. sign_in is devise method 
      if @user == nil
	render :status=>400, :json=>{:message=>"Invalid token."}
      end
    end
  end


  def register_external(username, password)
    u = User.find_by_username(username)
    if u != nil
      return nil
    end

    user = User.new({:username => username, :password => password})
    user.encrypted_password = ::BCrypt::Password.create("#{password}#{user.class.pepper}", cost: user.class.stretches).to_s
    user.isApproved = false

    if user.save!
      return user
    else
      puts user.errors.messages
      return nil
    end
  end


end

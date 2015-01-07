class UsersController < ApplicationController

  skip_before_filter :after_token_authentication, :only => :register
  def register
    user = User.new(params[:user])
    if user.save
      render :json=> user.as_json(:auth_token=>user.authentication_token, :username=>user.username), :status=>201
      return
    else
      warden.custom_failure!
      render :json=> user.errors, :status=>422
    end
  end

  def make_admin
    if current_user.isAdmin
      u = User.find(params[:userid])
      if u.present?
        u.isAdmin = true
        u.save!
      end
      return "Success." 
    end
      
    return "You are not an admin!"
  end

  def index
      @users = User.all
  end

  def show
    @user = User.find_by_id(params[:id])
    unless @user == current_user
      render status: :unauthorized
    end
  end

  #GET /users/info
  def info
    @user = User.find_by_authentication_token(params[:authentication_key])
    if @user == nil
      render :status=>400, :json=>{:message=>"Invalid token."}
      return
    end

    respond_to do |format|
      format.json { render :show} 
    end
  end
end

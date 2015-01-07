class TokensController < ApplicationController
    skip_before_filter :verify_authenticity_token
    respond_to :json
    def create
      username = params[:username]
      password = params[:password]
      if request.format != :json
        render :status=>406, :json=>{:message=>"The request must be JSON."}
        return
      end
 
    if username.nil? or password.nil?
       render :status=>400,
              :json=>{:message=>"The request must contain the username and password."}
       return
    end
 
    @user=User.authenticate_with_kerberos(params)
    if @user == nil
      render :status=>400, :json=>{:message=>"Invalid username or password."}
      return
    end

    #@user = User.find_by_username(params[:username])
    #if nil == @user
     # @user=User.authenticate_with_kerberos(params)
      #if @user == nil
       # render :status=>400, :json=>{:message=>"Invalid username or password."}
        #return
      #end
    #else
      #check if db user is valid
     # puts @user.username
      #if !@user.valid_password?(params[:password])
       # puts "fail"
        #render :status=>400, :json=>{:message=>"Invalid username or password."}
        #return
      #end
    #end


# http://rdoc.info/github/plataformatec/devise/master/Devise/Models/TokenAuthenticatable
    @user.ensure_authentication_token!
 
    render :status=>200, :json=>{:token=>@user.authentication_token}
  end
 
  def destroy
    @user=User.find_by_authentication_token(params[:id])
    if @user.nil?
      logger.info("Token not found.")
      render :status=>404, :json=>{:message=>"Invalid token."}
    else
      @user.reset_authentication_token!
      render :status=>200, :json=>{:token=>params[:id]}
    end
  end
end

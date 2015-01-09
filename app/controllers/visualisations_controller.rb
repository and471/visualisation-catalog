class VisualisationsController < ApplicationController
  require 'date'
  require 'color-thief'

  before_action :set_visualisation, only: [:show, :edit, :update, :destroy]
  
  # GET /visualisations/:visid/vote
  def vote
    v = Visualisation.find_by_id(params[:visid])
    if v != nil
      v.votes = v.votes + 1
      v.save!
      redirect_to "#/visualisations/#{params[:visid]}?voted=true"
      return
    end

    render :status => :internal_server_error, :text => "No such vis."
  end

  def get_all
    @visualisations = Visualisation.all
    respond_to do |format|
      format.json { render :index }
    end
  end

  
  def display
    v = Visualisation.find_by_id(params[:visid])
    if v == nil
      render :status => 500, :text => "No such vis"
      return
    end

    if v.content_type == "weblink"
      redirect_to v.link
      return
    end

    @id = params[:visid]
    #TODO set @type. can use v.content.file.extension.downcase
    #check content uploader for whitelisted file extensions

    render "display" #will render display.html.erb in visualisation views dir
  end

  # TODO
  # GET /visualisations/:visid/render_vis
  def display_internal
    v = Visualisation.find_by_id(params[:visid])
    if v == nil
      render :status => :internal_server_error, :text => "No such vis."
      return
    end

    if v.content.file.extension.downcase == "zip"
      #TODO - static web content
      return
    end


    send_file v.content.path, :disposition => "inline"
    #TODO does not work for videos

  end


  # GET /visualisations/current/:screennum
  def current
    now = DateTime.now
    @session = PlayoutSession.where(
      "start_time <= ? AND end_time >= ? AND start_screen <= ? AND end_screen >= ? ",
      now, now, params[:screennum], params[:screennum]).first

    @vis = @session.visualisation
  end



  # PATCH /visualisations/:visid/approve
  def approve
    puts current_user
    if current_user.isAdmin
      v = Visualisation.find_by_id(params[:visid])
      unless v == nil
        v.approved = true
        v.save!
      end
    end

    render :nothing => true
  end

  
  # DELETE /visualisations/:visid/reject
  def reject
    if current_user.isAdmin
      v = Visualisation.find_by_id(params[:visid])
      unless v == nil
        v.delete
      end
    end
    render :nothing => true 
 end
  
  # GET /visualisations
  # GET /visualisations.json
  def index

    @expandAuthor = params[:expandAuthor]
    @visualisations = Visualisation.all
    if params[:needsModeration] != nil
      if current_user == nil
        render status: :unauthorized
        return
      end

      if !current_user.isAdmin
        render status: :unauthorized
	return
      end

      @needsModeration = true   
    else
      @needsModeration = false
    end

    if params[:onlyVis] != nil
      @onlyVis = true   
    else
      @onlyVis = false
    end

    if params[:userid] == nil
      if params[:newest] != nil
      @visualisations = get_newest_n(@onlyVis, !@needsModeration, params[:newest])
      end

      if @needsModeration
        @visualisations = @visualisations.select{ |vis| !vis.approved }
      else
        @visualisations = @visualisations.select{ |vis| vis.approved }
      end

      if @onlyVis
        @visualisations = @visualisations.select{ |vis| vis.vis_type = "vis" }
      end

      if params[:popular] != nil
        @visualisations.sort_by{ |vis| vis["votes"] }.reverse! 
      end
      
    else
      #want visualisations of a particular user
      u = User.find_by_id(params[:userid])
      if u == nil
        return "no such user"
      end

      if params[:needsModeration] != nil
        @visualisations = u.visualisations.approved(false).vis
      else
        @visualisations = u.visualisations.approved(true).vis
      end
    end

    
  end

  def get_newest_n(onlyvis, approved, n)
    if onlyvis
      return Visualisation.where(approved: approved, vis_type: "vis").order(created_at: :desc).take(n)
    else
      return Visualisation.where(approved: approved).order(created_at: :desc).take(n)

    end
  end

  # GET /visualisations/1
  # GET /visualisations/1.json
  def show
    @visualisation = Visualisation.find(params[:id])

    if !@visualisation.approved
      if params[:authentication_key] == nil
        render status: :unauthorized
        puts "No auth token"
      else
        if !current_user.isAdmin
          render status: :unauthorizedi 
          puts "Trying to show a non-approved vis without an admin"
        end
      end
    end
  end

  # GET /visualisations/new
  def new
    @visualisation = Visualisation.new
  end

  # GET /visualisations/1/edit
  def edit
  end

  # POST /visualisations
  # POST /visualisations.json
  def create
    p = visualisation_params
    @visualisation = Visualisation.new(p)

    current_user.visualisations << @visualisation
    @visualisation.user = current_user

    saved = @visualisation.save

    if saved then
        # Handle background colour extraction in a separate thread
        $sc_path = @visualisation.screenshot.path
        $id = @visualisation.id
    
        Thread.new do
        
          puts "START(#{$id}): extracting bgcolour from #{$sc_path}"
        
          bgcolour = getBackgroundColor($sc_path)
          
          puts "START(#{$id}): extracting bgcolour from #{$sc_path}"
          
          v = Visualisation.find_by_id($id)
          v.bgcolour = bgcolour
          v.save!
          ActiveRecord::Base.connection.close
        end
    end

    respond_to do |format|
      if saved
        format.json { render :show, status: :created, location: @visualisation }
      else
        format.html { render :new }
        format.json { render json: @visualisation.errors, status: :unprocessable_entity }
      end
    end


  end

  # PATCH/PUT /visualisations/1
  # PATCH/PUT /visualisations/1.json
  def update
    respond_to do |format|
      if @visualisation.update(visualisation_params)
        format.html { redirect_to @visualisation, notice: 'Visualisation was successfully updated.' }
        format.json { render :show, status: :ok, location: @visualisation }
      else
        format.html { render :edit }
        format.json { render json: @visualisation.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /visualisations/1
  # DELETE /visualisations/1.json
  def destroy
    @visualisation.destroy
    respond_to do |format|
      format.html { redirect_to visualisations_url, notice: 'Visualisation was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_visualisation
      @visualisation = Visualisation.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def visualisation_params
      params.require(:visualisation).permit(:name, :link, :description, :notes, :author_info, :content_type, :file, :approved, :vis_type, :content, :screenshot, :min_playtime, :bgcolour)
    end
end

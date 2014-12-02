class VisualisationsController < ApplicationController
  require 'date'
  require 'color-thief'

  before_action :set_visualisation, only: [:show, :edit, :update, :destroy]

  def get_all
    @visualisations = Visualisation.all
    respond_to do |format|
      format.json { render :index }
    end
  end

  # GET /visualisations/:visid/render_vis
  def render_vis
    v = Visualisation.find_by_id(params[:visid])
    if v == nil
      render :status => :internal_server_error, :text => "No such vis."
      return
      #TODO: could show default vis here
    end

    if v.content_type == "weblink"
      redirect_to v.link
      return
    end

    #else we have a visualisation
    #TODO: render a html file that displays the vis

  end


  # GET /visualisations/current/:screennum
  def current
    now = DateTime.now
    @session = PlayoutSession.where(
      "start_time <= ? AND end_time >= ? AND start_screen <= ? AND end_screen >= ? ",
      now, now, params[:screennum], params[:screennum]).first

    #TODO: this assumes one is there, else we may need to get default visualisation
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
    else 
       redirect_to '/visualisations'
    end
  end

  
  # DELETE /visualisations/:visid/reject
  def reject
    if current_user.isAdmin
      v = Visualisation.find_by_id(params[:visid])
      unless v == nil
        v.delete
      end
    end
    redirect_to '/visualisations'
  end
  
  # GET /visualisations
  # GET /visualisations.json
  def index
    puts current_user.username

    @expandAuthor = params[:expandAuthor]
    @visualisations = Visualisation.all
    if params[:needsModeration] != nil
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
    puts current_user.username
    p = visualisation_params
    @visualisation = Visualisation.new(p)

    @visualisation.bgcolour = getBackgroundColor(@visualisation.screenshot.path)

    #TODO: uncomment this when we have users
    puts current_user.username
    current_user.visualisations << @visualisation
    @visualisation.user = current_user


    respond_to do |format|
      if @visualisation.save
        format.html { redirect_to @visualisation, notice: 'Visualisation was successfully created.' }
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
      params.require(:visualisation).permit(:name, :link, :description, :notes, :author_info, :content_type, :file, :approved, :vis_type, :content, :screenshot, :min_playtime)
    end
end

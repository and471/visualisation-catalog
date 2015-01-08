# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

user = User.find_by_username("chl312")
if user != nil
  user.isAdmin = true
  user.save!
end

user = User.find_by_username("tjt12")
if user != nil
  user.isAdmin = true
  user.save!
end

user = User.find_by_username("ath12")
if user != nil
  user.isAdmin = true
  user.save!
end
 
user = User.find_by_username("ekh12")
if user != nil
  user.isAdmin = true
  user.save!
end

if Visualisation.all.empty?
  user = User.find_by_username("chl312")
  if user != nil
    visDefault = 
      Visualisation.create([
        {:name => "Logo",
         :approved => true,
         :vis_type => :vis,
         :content_type => :file,
         :link => "",
         :content => "/sample_visualisations/DSI.PNG",
         :description => "Logo of Data Science Institute",
         :screenshot => File.open("sample_visualisations/DSI.PNG"),
         :isDefault => true,
         :min_playtime => Const.SECONDS_IN_UNIT_TIME}
      ])
    visNotDefault =
      Visualisation.create([
       {:name => "Logo",
        :approved => true,
        :vis_type => :vis,
        :content_type => :file,
        :link => "",
        :content => "/sample_visualisations/DSI.PNG",
        :description => "Logo of Data Science Institute",
        :screenshot => File.open("sample_visualisations/DSI.PNG"),
        :min_playtime => Const.SECONDS_IN_UNIT_TIME}
      ])
    user.visualisations << [visDefault, visNonDefault]
  end
end
 

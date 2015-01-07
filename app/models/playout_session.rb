class PlayoutSession < ActiveRecord::Base
  belongs_to :visualisation
  belongs_to :timeslot
  belongs_to :programme

  validates :start_time, presence: true
  validates :end_time, presence: true
  validates :start_screen, presence: true
  validates :end_screen, presence: true
end

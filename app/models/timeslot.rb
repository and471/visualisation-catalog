class Timeslot < ActiveRecord::Base
  has_many :programmes
  has_many :playout_sessions

  validates :start_time, presence: true
  validates :end_time, presence: true
end

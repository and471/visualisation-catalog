class Programme < ActiveRecord::Base
  belongs_to :visualisation
  belongs_to :timeslot
  has_many :playout_sessions

  validates :visualisation_id, presence: true
  validates :timeslot_id, presence: true

  attr_default :priority, 5
  attr_default :screens, 1

  def duration
    return self.visualisation.min_playtime
  end

  def period
    if (priority > 0)
      return (self.visualisation.min_playtime / self.priority.to_f)
    else
      return Const.LARGE_PERIOD
    end
  end

  def <=>(otherProg)
    durationDiff =
      self.visualisation.min_playtime - otherProg.visualisation.min_playtime
    return (durationDiff == 0) ? (rand(2) * 2 - 1) : (durationDiff <=> 0)
  end

end

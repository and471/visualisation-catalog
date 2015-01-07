module Const
  extend ActiveSupport::Concern

  # Screens, rows and columns
  def self.NO_OF_SCREENS
    self.DEFAULT_ROW * self.DEFAULT_COLUMN 
  end

  def self.MIN_NO_SCREENS
    1
  end

  def self.FIRST_SCREEN
    0
  end

  def self.DEFAULT_ROW
    1
  end
 
  def self.DEFAULT_COLUMN
    4
  end

  # Priority and time period issues
  def self.MIN_PRIORITY
    0
  end

  def self.SECONDS_IN_UNIT_TIME
    60
  end

  # Seven days as a large period
  def self.LARGE_PERIOD
    86400 * 7
  end

  def self.MAX_PLAYOUT_TIME_ERROR
    0.20
  end

  def self.MAX_TRY_FILL
    3
  end

end

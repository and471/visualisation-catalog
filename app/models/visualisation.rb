class Visualisation < ActiveRecord::Base

  enum content_type: [ :file, :weblink ]
  enum vis_type: [ :vis, :advert ]

  validates :content_type, presence: true
  validates :vis_type, presence: true
  validates :name, presence: true
  validates :description, presence: true
  validates :screenshot, presence: true

  belongs_to :user
  has_many :programmes
  has_many :playout_sessions
  attr_default :votes, 0
  has_many :comments
  attr_default :approved, false
  attr_default :isDefault, false
  attr_default :min_playtime, Const.SECONDS_IN_UNIT_TIME

  #some filters!
  scope :approved, -> (boolean) {where approved: true}
  scope :vis, ->  {where vis_type: "vis"}

  mount_uploader :content, ContentUploader
  mount_uploader :screenshot, ScreenshotUploader
end

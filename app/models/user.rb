class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :kerberos_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable,
         :token_authenticatable

         
  has_many :visualisations
  has_many :comments

  mount_uploader :avatar, AvatarUploader

  validates :username, presence: true
  validates_uniqueness_of :username

  before_save :ensure_authentication_token
  attr_default :isAdmin, false
  attr_default :isApproved, true
end

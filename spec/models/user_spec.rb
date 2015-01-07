require 'rails_helper'

RSpec.describe User do
  context 'by default' do
    it 'should not be admin' do
      user = User.new({:name => 'John Doe', :username => 'test'})
      expect(user.isAdmin).to be false
    end
  end
end

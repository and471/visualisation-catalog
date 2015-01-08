require 'rails_helper'

RSpec.describe "requests/index", :type => :view do
  before(:each) do
    assign(:requests, [
      Request.create!(
        :name => "Name",
        :company => "Company",
        :email => "Email",
        :notes => "MyText",
        :desired_username => "Desired Username"
      ),
      Request.create!(
        :name => "Name",
        :company => "Company",
        :email => "Email",
        :notes => "MyText",
        :desired_username => "Desired Username"
      )
    ])
  end

  it "renders a list of requests" do
    render
    assert_select "tr>td", :text => "Name".to_s, :count => 2
    assert_select "tr>td", :text => "Company".to_s, :count => 2
    assert_select "tr>td", :text => "Email".to_s, :count => 2
    assert_select "tr>td", :text => "MyText".to_s, :count => 2
    assert_select "tr>td", :text => "Desired Username".to_s, :count => 2
  end
end

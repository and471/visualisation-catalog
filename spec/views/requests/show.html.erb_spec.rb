require 'rails_helper'

RSpec.describe "requests/show", :type => :view do
  before(:each) do
    @request = assign(:request, Request.create!(
      :name => "Name",
      :company => "Company",
      :email => "Email",
      :notes => "MyText",
      :desired_username => "Desired Username"
    ))
  end

  it "renders attributes in <p>" do
    render
    expect(rendered).to match(/Name/)
    expect(rendered).to match(/Company/)
    expect(rendered).to match(/Email/)
    expect(rendered).to match(/MyText/)
    expect(rendered).to match(/Desired Username/)
  end
end

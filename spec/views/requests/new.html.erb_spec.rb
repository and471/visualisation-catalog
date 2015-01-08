require 'rails_helper'

RSpec.describe "requests/new", :type => :view do
  before(:each) do
    assign(:request, Request.new(
      :name => "MyString",
      :company => "MyString",
      :email => "MyString",
      :notes => "MyText",
      :desired_username => "MyString"
    ))
  end

  it "renders new request form" do
    render

    assert_select "form[action=?][method=?]", requests_path, "post" do

      assert_select "input#request_name[name=?]", "request[name]"

      assert_select "input#request_company[name=?]", "request[company]"

      assert_select "input#request_email[name=?]", "request[email]"

      assert_select "textarea#request_notes[name=?]", "request[notes]"

      assert_select "input#request_desired_username[name=?]", "request[desired_username]"
    end
  end
end

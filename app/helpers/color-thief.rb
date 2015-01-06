require 'RMagick'
require 'v8'

def getBackgroundColor(filePath)
	canvasPixels = []
	ctx = V8::Context.new
	ctx.load("color-thief.js")

	img = Magick::ImageList.new(filePath)
	pixels = img.get_pixels(0, 0, img.columns, img.rows)

	(0..img.columns).each do |x|
	    (0..img.rows).each do |y|

	    pixel = img.pixel_color(x, y)

	    canvasPixels.push(pixel.red/257)
	    canvasPixels.push(pixel.green/257)
	    canvasPixels.push(pixel.blue/257)
	    canvasPixels.push(255 - pixel.opacity/257)

	    end
	end

    pixel_count = img.columns * img.rows

    quality = 10
    if (pixel_count > 500000)  quality = 7
    if (pixel_count > 1000000) quality = 4
    if (pixel_count > 1500000) quality = 1
    
    if (pixel_count > 2000000) return "rgb(255,255,255)"

    color = ctx[:ColorThiefGetColor].call(canvasPixels, pixel_count, quality)
    color_string = "rgb(#{color[0]}, #{color[1]}, #{color[2]})"
    
	return color_string
end

if __FILE__ == $0
    puts getBackgroundColor("/home/guest/pink.png")
end

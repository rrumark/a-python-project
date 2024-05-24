from flask import Flask, render_template, request, jsonify
import matplotlib.colors as mcolors

app = Flask(__name__)

def hex_to_rgb_percent(hex_color):
    rgb = mcolors.hex2color(hex_color)
    red_percent = round(rgb[0] * 100, 2)
    green_percent = round(rgb[1] * 100, 2)
    blue_percent = round(rgb[2] * 100, 2)
    return red_percent, green_percent, blue_percent

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get-color', methods=['POST'])
def get_color():
    hex_color = request.form['color']
    red_percent, green_percent, blue_percent = hex_to_rgb_percent(hex_color)
    return jsonify({
        'color': hex_color,
        'redPercent': red_percent,
        'greenPercent': green_percent,
        'bluePercent': blue_percent
    })

if __name__ == '__main__':
    app.run(debug=True)

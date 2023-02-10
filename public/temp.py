import json
import os

# Load the JSON file
with open('questions.json', 'r') as json_file:
    data = json.load(json_file)
    questions = data['questions']

# Get a list of filenames in the directory
directory = './imgs'
filenames = os.listdir(directory)

# Remove elements from the 'questions' array if the 'image_id' property cannot be found in the directory
questions = [q for q in questions if "abstract_v002_train2015_" + str(q['image_id']).zfill(12) + ".png" in filenames]

# Save the modified 'questions' array to the JSON file
with open('questions.json', 'w') as json_file:
    data['questions'] = questions
    json.dump(data, json_file)

import requests

# Define the list of ngrok links
ngrok_links = [
    "https://826f-37-165-191-93.ngrok-free.app/predict",
    "https://8c18-195-154-48-144.ngrok-free.app/predict",
    "https://bbda-89-30-29-68.ngrok-free.app/predict"
]

# Function to prompt user for parameter values
def get_user_parameters():
    parameters = {}
    parameters["sepal_length"] = float(input("Enter sepal length: "))
    parameters["sepal_width"] = float(input("Enter sepal width: "))
    parameters["petal_length"] = float(input("Enter petal length: "))
    parameters["petal_width"] = float(input("Enter petal width: "))
    return parameters

# Function to calculate the mean probability for each flower type
def calculate_mean_probabilities(probabilities_list):
    mean_probabilities = {"setosa": 0, "versicolor": 0, "virginica": 0}
    total_probabilities = len(probabilities_list)
    for probs in probabilities_list:
        for flower, prob in probs.items():
            mean_probabilities[flower] += prob / total_probabilities
    return mean_probabilities

def get_predicted_flower(mean_probabilities):
    return max(mean_probabilities, key=mean_probabilities.get)

# Prompt user for parameter values
parameters = get_user_parameters()

# List to store probabilities returned by each ngrok link
all_probabilities = []

# Send requests to each ngrok link with user-defined parameters
for link in ngrok_links:
    print(f"Sending request to {link}")
    response = requests.get(link, params=parameters)
    if response.status_code == 200:
        data = response.json()
        probabilities = data["probabilities"]
        all_probabilities.append(probabilities)
        print("Probabilities:")
        for key, value in probabilities.items():
            print(f"{key}: {value}")
        print()
    else:
        print(f"Failed to retrieve data from {link}")

# Calculate mean probabilities for each flower type
mean_probabilities = calculate_mean_probabilities(all_probabilities)
print("Mean Probabilities:")
for flower, mean_prob in mean_probabilities.items():
    print(f"{flower}: {mean_prob}")

predicted_flower = get_predicted_flower(mean_probabilities)
print(f"\nPredicted Flower: {predicted_flower}")

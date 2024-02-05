from flask import Flask, request, jsonify
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import numpy as np

# Load the Iris dataset
iris = load_iris()
X = iris.data
y = iris.target

# Split the dataset into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train a random forest classifier
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Initialize Flask app
app = Flask(__name__)

# Define predict route
@app.route('/predict', methods=['GET'])
def predict():
    # Get request arguments
    sepal_length = float(request.args.get('sepal_length'))
    sepal_width = float(request.args.get('sepal_width'))
    petal_length = float(request.args.get('petal_length'))
    petal_width = float(request.args.get('petal_width'))

    # Make prediction
    features = np.array([[sepal_length, sepal_width, petal_length, petal_width]])
    prediction = model.predict(features)[0]
    predicted_class = iris.target_names[prediction]
    probabilities = model.predict_proba(features)[0]
    # Return prediction in standardized format
    response = {
        'prediction': predicted_class,
	'probabilities': {iris.target_names[i]: round(probabilities[i], 4) for i in range(len(iris.target_names))},
        'model_used': 'Random Forest Classifier'
    }
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)

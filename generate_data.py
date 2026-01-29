import pandas as pd
import numpy as np

# Generate 500 diverse samples
np.random.seed(42)

def generate_data():
    data = []
    # High: 150 samples
    for _ in range(150):
        f = np.random.randint(200000, 1000000)
        l = np.random.randint(10000, 50000)
        s = np.random.randint(1000, 5000)
        c = np.random.randint(500, 2000)
        data.append([f, l, s, c, 'High'])
    
    # Medium: 200 samples
    for _ in range(200):
        f = np.random.randint(20000, 150000)
        l = np.random.randint(1000, 8000)
        s = np.random.randint(100, 1000)
        c = np.random.randint(50, 400)
        data.append([f, l, s, c, 'Medium'])
        
    # Low: 150 samples
    for _ in range(150):
        f = np.random.randint(100, 15000)
        l = np.random.randint(10, 500)
        s = np.random.randint(1, 100)
        c = np.random.randint(1, 50)
        data.append([f, l, s, c, 'Low'])

    df = pd.DataFrame(data, columns=['followers', 'likes', 'shares', 'comments', 'influence_label'])
    df = df.sample(frac=1).reset_index(drop=True)
    df.to_csv('social_training_data.csv', index=False)
    print("Created social_training_data.csv with 500 diverse records.")

if __name__ == "__main__":
    generate_data()

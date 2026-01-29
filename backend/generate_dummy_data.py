import pandas as pd
import numpy as np

# Number of records
n = 1000

# Generate random data
data = {
    'followers': np.random.randint(100, 1000000, size=n),
    'likes': np.random.randint(10, 50000, size=n),
    'shares': np.random.randint(0, 5000, size=n),
    'comments': np.random.randint(0, 2000, size=n),
}

df = pd.DataFrame(data)

# Create a logical target based on metrics (for training demonstration)
df['engagement_score'] = (df['likes'] + df['shares'] + df['comments']) / df['followers']
df['influence_label'] = pd.cut(
    df['followers'], 
    bins=[0, 10000, 100000, float('inf')], 
    labels=['Low', 'Medium', 'High']
)

# Sort columns for cleaner display
df = df[['followers', 'likes', 'shares', 'comments', 'influence_label']]

# Save to CSV
df.to_csv('sample_dataset.csv', index=False)
print("sample_dataset.csv generated successfully!")

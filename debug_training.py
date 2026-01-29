import requests

BASE_URL = "http://127.0.0.1:8000/api"

def test_training():
    # Login
    login_data = {"username": "debug_admin", "password": "password123"}
    resp = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    if resp.status_code != 200:
        print("Login failed:", resp.text)
        return
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Check metrics (just to verify connection)
    resp = requests.get(f"{BASE_URL}/ml/metrics", headers=headers)
    print("Metrics check:", resp.status_code)

    # Note: I need a dataset_id. I'll check what's in the DB.
    # For now, I'll just try to hit /train?dataset_id=1
    resp = requests.post(f"{BASE_URL}/ml/train?dataset_id=1", headers=headers)
    print("Training result:", resp.status_code, resp.text)

if __name__ == "__main__":
    test_training()

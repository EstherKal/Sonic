import os
import re

def check_comments_for_non_english_code(file_path):
    non_english_pattern = re.compile(r"#.*[^\x00-\x7F]+.*")  # Regex to find non-English characters in comments
    
    with open(file_path, 'r', encoding='utf-8') as file:
        code = file.read()
    
    matches = non_english_pattern.findall(code)
    return matches

def main():
    repo_dir = os.getenv('GITHUB_WORKSPACE')  # This is the GitHub Action workspace directory
    files = [f for f in os.listdir(repo_dir) if f.endswith('.js') or f.endswith('.py')]  # Include more file types if necessary

    for file in files:
        file_path = os.path.join(repo_dir, file)
        non_english_comments = check_comments_for_non_english_code(file_path)

        if non_english_comments:
            print(f"Non-English comments found in {file_path}:")
            for comment in non_english_comments:
                print(comment)
            exit(1)  # Exit with error if non-English comments are found

    print("All comments are in English!")
    
if __name__ == '__main__':
    main()

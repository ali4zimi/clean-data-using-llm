class TemplateService:
    @staticmethod
    def get_prompt_templates():
        """Return available prompt templates"""
        templates = [
            {
                "id": 1,
                "name": "German Word Extraction",
                "prompt": "You are a language learning assistant. Please extract all German words and their respective meanings " +
                        "from the following text. Find the English meaning and, if the word is a noun, include its gender. " +
                        "Classify the words into relevant categories (e.g., food, travel, emotions, etc.). " +
                        "If a word does not have an example sentence, create one. \n\n" +
                        "Format your response using the following structure: \n" +
                        "de_word, de_example, de_gender, de_category, en_word, en_example"
            },
            {
                "id": 2,
                "name": "Dutch Word Extraction",
                "prompt": "You are a language learning assistant. Please extract all Dutch words and their respective meanings " +
                        "from the following text. Find the English meaning and, if the word is a noun, include its gender. " +
                        "Classify the words into relevant categories (e.g., food, travel, emotions, etc.). " +
                        "If a word does not have an example sentence, create one. \n\n" +
                        "Format your response using the following structure: \n" +
                        "nl_word, nl_example, nl_category, en_word, en_example"
            },
            {
                "id": 3,
                "name": "Extract customer data",
                "prompt": "You are a data extraction assistant. Please extract customer information from the following text. " +
                        "Identify and extract the following fields: name, email address, phone number, and physical address. " +
                        "If any field is not present, indicate it as 'Not found'."
            },
            {
                "id": 4,
                "name": "Extract product data",
                "prompt": "You are a data extraction assistant. Please extract product information from the following text. " +
                        "Identify and extract the following fields: product name, price, description, and category. " +
                        "If any field is not present, indicate it as 'Not found'."
            },
            {
                "id": 5,
                "name": "Extract financial data",
                "prompt": "You are a financial data extraction assistant. Please extract financial information from the following text. " +
                        "Identify and extract the following fields: transaction date, amount, description, and category. " +
                        "If any field is not present, indicate it as 'Not found'."
            }
        ]
        return templates

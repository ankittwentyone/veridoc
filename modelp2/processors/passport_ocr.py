import torch
from ocr_engine import run_ocr

#visual fields:
vf_label = {
    "document_type":None,
    "issuing_country":None,
    "passport_number":None,
    "surname":None,
    "given_name":None,
    "date_of_birth":None,
    "place_of_birth":None,
    "place_of_issue":None,
    "date_of_issue":None,
    "date_of_expiry":None,
    "sex":None,
    "nationality":None,
    
}

#MRZ

#Line 1 focuses on document type, issuing country, and the passport holder's name.
#example line 1 :P<UTOERIKSSON<<ERIKA<<<<<<<<<<<<<<<<<<<<<<<<<

Line1_labels = {
	"document_code":None,
    "issuing_country":None,
    "full_name":None,
}


#Line 2 contains passport numbers, dates, nationality, and checksums used to verify data integrity.
#example line 2 : L898902C<3UTO6908061F9406236ZE184226B<<<<<14

Line2_labels = {
    "passport_number":None,
    "passport_number_check_digit":None,
    "nationality":None,
    "birth_date":None,
    "birth_date_check_digit":None,
    "gender_sex":None,
    "expiration_date":None,
    "expiration_date_check_digit":None,
    "o&_pID":None,
    "o&_pID_check_digit":None,
    "overall_check_digit":None,
}

path = path
result = run_ocr(path)

def checker(result):
    for item in result:
        if id == 21:
            if len(item) == 44:
                if (item.startswith("P")or item.startswith("V") or item.startswith("A")) and len(item) :
                    
            
                


import boto3

questions = open('./qs.xml', mode='r').read()
answers = open('./ans.xml', mode='r').read()

mturk = boto3.client('mturk', 
                      region_name='us-east-1', 
                      endpoint_url='https://mturk-requester-sandbox.us-east-1.amazonaws.com')

qual_response = mturk.create_qualification_type(
                        Name='VGA test',
                        Keywords='test, qualification, sample, boto',
                        Description='This is a brief visual scene understanding test',
                        QualificationTypeStatus='Active',
                        Test=questions,
                        AnswerKey=answers,
                        TestDurationInSeconds=300)

print(qual_response['QualificationType']['QualificationTypeId'])
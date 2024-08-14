import datetime
import json
from django.shortcuts import redirect, render, HttpResponse
from django.views import View
from django.contrib import messages
from .models import Job, Applicant, ShortList
from .utils import consult_ai

# Create your views here.
def home(request):
    jobs = Job.objects.all()
    
    job_data = {}

    for j in jobs:
        lower_bound = j.salary * 0.9
        upper_bound = j.salary * 1.1
        posted = (datetime.datetime.today().date() - j.date_posted).days
        applicants = j.applicants.all().count()
        shortlisted = j.shortlist.all().count()

        job_data[j.id] = {
            'job': j,
            'lower_bound': f"{lower_bound:.2f}",
            'upper_bound': f"{upper_bound:.2f}",
            'posted': posted,
            'applicants': applicants,
            'shortlisted': shortlisted
        }
    
    return render(request, 'app/hr_dashboard.html', {'job_data': job_data, 'total_jobs': Job.objects.all().count()})

class NewJob(View):
    
    def get(self, request):
        return render(request, 'app/new_job.html')
    
    def post(self, request):
        job_title = request.POST.get('jobTitle')
        department = request.POST.get('department')
        salary = request.POST.get('salary')
        location = request.POST.get('location')
        introduction = request.POST.get('introduction')
        description = request.POST.get('description')
        responsabilities = request.POST.get('responsabilities')
        qualifications = request.POST.get('qualifications')

        print('Job Title:', job_title)
        print('Department:', department)
        print('Salary:', salary)
        print('Location:', location)
        print('Introduction:', introduction)
        print('Description:', description)
        print('Responsabilities:', responsabilities)
        print('Qualifications:', qualifications)

        if job_title:
            if department:
                if salary != '' and int(salary) > 0:
                    if location:
                        if introduction:
                            if description:
                              if responsabilities:
                                  if qualifications:
                                      # Add job to database

                                      new_job = Job.objects.create(job_title=job_title, department=department,
                                                                     salary=salary, location=location,
                                                                     introduction=introduction,
                                                                     brief_posting_description=description,
                                                                     responsabilities=responsabilities,
                                                                     qualifications=qualifications)
                                      new_job.save()
                                      messages.success(request, 'Job added successfully')
                                      return redirect('home')
                                  else:
                                      messages.warning(request, 'Qualifications is required')
                              else:
                                  messages.warning(request, 'Responsabilities is required')
                            else:
                                messages.warning(request, 'Description is required')
            else:
                messages.warning(request, 'Department is required')
        else:
            messages.warning(request, 'Job Title is required')

        return render(request, 'app/new_job.html')

class EditJob(View):
    def get(self, request, job_id):
        job = Job.objects.filter(id=job_id)[0]
        return render(request, 'app/edit_job.html', locals())

    def post(self, request, job_id):
        job = Job.objects.filter(id=job_id)[0]

        job_title = request.POST.get('jobTitle')
        department = request.POST.get('department')
        salary = request.POST.get('salary')
        location = request.POST.get('location')
        introduction = request.POST.get('introduction')
        description = request.POST.get('description')
        responsabilities = request.POST.get('responsabilities')
        qualifications = request.POST.get('qualifications')
        is_active = request.POST.get('recruiting')

        if job_title:
            if department:
                if salary != '' and int(salary) > 0:
                    if location:
                        if introduction:
                            if description:
                                if responsabilities:
                                    if qualifications:
                                        # Update job to db

                                        try:
                                            job.job_title = job_title
                                            job.department = department
                                            job.salary = salary
                                            job.location = location
                                            job.introduction = introduction
                                            job.brief_posting_description = description
                                            job.responsabilities = responsabilities
                                            job.qualifications = qualifications
                                            job.is_active = is_active
                                            job.save()
                                            messages.success(request, 'Job Updated Successfully')
                                            return redirect('home')

                                        except Exception as e:
                                            print(e)
                                            messages.warning(request, 'Job Update not successful')

                                    else:
                                        messages.warning(request, 'Enter qualifications')
                                else:
                                    messages.warning(request, 'Enter responsibilities')

                            else:
                                messages.warning(request, 'Enter description')
                        else:
                            messages.warning(request, 'Enter an introduction')
                    else:
                        messages.warning(request, 'Enter a valid location')
                else:
                    messages.warning(request, 'Enter a valid salary')
            else:
                messages.warning(request, 'Please add a department')
        else:
            messages.warning(request, 'Please add a job title')

        return render(request, 'app/edit_job.html')
    
def careers(request):
    jobs = Job.objects.filter(is_active=True)
    return render(request, 'app/careers.html', locals())

def job_detail_page(request, job_id):
    try:
        job = Job.objects.filter(id=job_id)[0]
        return render(request, 'app/job_detail.html', locals())
    
    except Exception as e:
        print(e)
        return HttpResponse('Job Not Found')

class ApplyJob(View):
    def get(self, request, job_id):
        try:
            job = Job.objects.filter(id=job_id)[0]
            return render(request, 'app/apply_job.html', locals())
        except Exception as e:
            print(e)
            return HttpResponse('Job Not Found')
        
    def post(self, request, job_id):
        try:
            job = Job.objects.get(id=job_id)

            first_name = request.POST.get('first_name')
            last_name = request.POST.get('last_name')
            gender = request.POST.get('gender')
            email = request.POST.get('email')
            location = request.POST.get('location')
            cv = request.FILES.get('cv')

            # Add applicant to db
            if not Applicant.objects.filter(email=email, job=job_id):
                new_applicant = Applicant.objects.create(first_name=first_name, last_name=last_name,
                                                     gender=gender, email=email, location=location, cv=cv,
                                                     job=job)
                # save details to the database
                new_applicant.save()
                return render(request, 'app/app_successful.html')

            messages.warning(request, 'You have already applied for this job')
          

        except Exception as e:
            print(e)
        return render(request, 'app/apply_job.html', locals())

def shortlist(request, job_id):
    job = Job.objects.get(id=job_id)

    short_list = job.shortlist.all().order_by('-score')

    shortlisted = short_list.count()

    return render(request, 'app/shortlist.html', locals())

def shortlist_candidates(request, job_id):
    try:
        job = Job.objects.get(id=job_id)
    except Job.DoesNotExist:
        messages.error(request, 'Job Not Found')
        return HttpResponse('Job Not Found')
    
    try:
        ShortList.objects.filter(job=job_id).delete()
        applicants = job.applicants.all()
        for applicant in applicants:
            response_str = consult_ai(job=job, cv_path=applicant.cv)
            if not response_str:
                messages.warning(request, f'No response for {applicant.first_name}')
                continue

            try:
                json_start = response_str.find('{')
                json_end = response_str.rfind('}') + 1
                if json_start != -1 and json_end != -1:
                    json_str = response_str[json_start:json_end]
                    response = json.loads(json_str)
                    print(f'Parsed response for {applicant.first_name}:', response)
                    if response.get('score', 0) >= 80:
                        new_shortlist = ShortList.objects.create(
                            job=job, 
                            applicant=applicant, 
                            score=response['score'],
                            summary=response['summary']
                        )
                        new_shortlist.save()
                    else:
                        messages.info(request, f'{applicant.first_name} did not meet the score threshold')
                else:
                    raise json.JSONDecodeError("No JSON object could be decoded", response_str, 0)
            except json.JSONDecodeError as e:
                print(f'Error parsing JSON for {applicant.first_name}:', e)
                messages.warning(request, f'Unable to parse response for {applicant.first_name}')
    except Exception as e:
        print(e)
        messages.error(request, 'Unable to shortlist candidates')

    return redirect('shortlist', job_id=job_id)
﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using TayaIT.Enterprise.EMadbatah.DAL;
using TayaIT.Enterprise.EMadbatah.Model;
using TayaIT.Enterprise.EMadbatah.Model.VecSys;
using TayaIT.Enterprise.EMadbatah.Vecsys;
using TayaIT.Enterprise.EMadbatah.BLL;
using System.Collections;
using TayaIT.Enterprise.EMadbatah.Util.Web;
using TayaIT.Enterprise.EMadbatah.Config;
using System.Text;
namespace TayaIT.Enterprise.EMadbatah.Web
{
    public partial class CreateNewSession : BasePage
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (CurrentUser.Role != Model.UserRole.Admin)
                Response.Redirect(Constants.PageNames.ERROR_PAGE + "?" + Constants.QSKeyNames.ERROR_TYPE + "=" + (int)ErrorType.Unauthorized);
            if (!Page.IsPostBack)
            {
                EMadbatahEntities context = new EMadbatahEntities();
                List<DefaultAttendant> DefaultAttendants = context.DefaultAttendants.Select(aa => aa).OrderBy(x => x.OrderByAttendantType).ToList();
                ddlPresident.DataSource = DefaultAttendants;
                ddlPresident.DataTextField = "Name";
                ddlPresident.DataValueField = "ID";
                ddlPresident.DataBind();
            }
        }

        protected void btnCreateNewSession_Click(object sender, EventArgs e)
        {
            Session sessionObj = fillValues();

            long SessionIDCreated = SessionHelper.CreateNewSession(sessionObj);


            if (SessionIDCreated != -1)
            {
                EMadbatahEntities context = new EMadbatahEntities();
                List<DefaultAttendant> DefaultAttendants = context.DefaultAttendants.Select(aa => aa).ToList();

                if (CBSessionStart.Checked)
                {
                    for (int i = 0; i < DefaultAttendants.Count; i++)
                    {
                        try
                        {
                            {
                                Attendant attendant = new Attendant();
                                attendant.Name = DefaultAttendants[i].Name;
                                attendant.JobTitle = DefaultAttendants[i].JobTitle;
                                attendant.DefaultAttendantID = DefaultAttendants[i].ID;
                                attendant.SessionAttendantType = sessionObj.SessionStartFlag;
                                attendant.EparlimentID = sessionObj.EParliamentID;
                                attendant.Type = DefaultAttendants[i].Type;
                                attendant.AttendantTitle = DefaultAttendants[i].AttendantTitle;
                                attendant.OrderByAttendantType = DefaultAttendants[i].OrderByAttendantType;
                                attendant.AttendantAvatar = DefaultAttendants[i].AttendantAvatar;
                                attendant.State = 1;
                                bool res = AttendantHelper.AddNewSessionAttendant(attendant, SessionIDCreated);
                            }
                        }
                        catch (Exception exx)
                        {

                        }
                    }
                }
                else
                {
                    for (int i = 0; i < DefaultAttendants.Count; i++)
                    {
                        Attendant attendant = new Attendant();
                        attendant.Name = DefaultAttendants[i].Name;
                        attendant.JobTitle = DefaultAttendants[i].JobTitle;
                        attendant.DefaultAttendantID = DefaultAttendants[i].ID;
                        attendant.SessionAttendantType = (int)SessionOpenStatus.OnTime;//1
                        attendant.EparlimentID = sessionObj.EParliamentID;
                        attendant.Type = DefaultAttendants[i].Type;
                        attendant.AttendantTitle = DefaultAttendants[i].AttendantTitle;
                        attendant.OrderByAttendantType = DefaultAttendants[i].OrderByAttendantType;
                        attendant.AttendantAvatar = DefaultAttendants[i].AttendantAvatar;
                        attendant.State = 1;
                        bool res = AttendantHelper.AddNewSessionAttendant(attendant, SessionIDCreated);

                        attendant = new Attendant();
                        attendant.Name = DefaultAttendants[i].Name;
                        attendant.JobTitle = DefaultAttendants[i].JobTitle;
                        attendant.DefaultAttendantID = DefaultAttendants[i].ID;
                        attendant.SessionAttendantType = (int)SessionOpenStatus.NotOnTime;//0
                        attendant.EparlimentID = sessionObj.EParliamentID;
                        attendant.Type = DefaultAttendants[i].Type;
                        attendant.AttendantTitle = DefaultAttendants[i].AttendantTitle;
                        attendant.OrderByAttendantType = DefaultAttendants[i].OrderByAttendantType;
                        attendant.AttendantAvatar = DefaultAttendants[i].AttendantAvatar;
                        attendant.State = 1;
                        res = AttendantHelper.AddNewSessionAttendant(attendant, SessionIDCreated);
                    }
                }
            }
            Response.Redirect("Default.aspx");
        }

        public Session fillValues()
        {
            DateTime plannedStartDate = Convert.ToDateTime(txtDate.Text + " " + txtTime.Text);
            DateTime ActualStartTime = Convert.ToDateTime(txtStartDate.Text + " " + txtStartTime.Text);
            string president = "مرزوق على الغانم";//txtPresident.Text;
            string place = "الكويت";
            int EParliamentID = int.Parse(txtEParliamentID.Text);
            string type = ddlType.SelectedValue;
            Int64 Season = Int64.Parse(ddlSeason.SelectedValue);
            Int64 Stage = Int64.Parse(ddlStage.SelectedValue);
            Int32 PresidentID = Int32.Parse(ddlPresident.SelectedValue);
            string subject = txtSubject.Text;
            int SessionStartFlag = CBSessionStart.Checked ? (int)SessionOpenStatus.OnTime : (int)SessionOpenStatus.NotOnTime;
            string StageType = ddlStagetype.SelectedValue;

            Session sessionObj = new DAL.Session();
            sessionObj.Date = DateTime.Now;
            sessionObj.StartTime = plannedStartDate;
            sessionObj.EndTime = ActualStartTime;
            sessionObj.Type = type;
            sessionObj.President = president;
            sessionObj.Place = place;
            sessionObj.EParliamentID = EParliamentID;

            sessionObj.Season = Season;
            sessionObj.Stage = Stage;
            sessionObj.StageType = StageType;
            sessionObj.Serial = EParliamentID;
            sessionObj.SessionStatusID = (int)TayaIT.Enterprise.EMadbatah.Model.SessionStatus.New;

            sessionObj.Subject = subject;
            sessionObj.ReviewerID = CurrentUser.ID;
            sessionObj.SessionStartFlag = SessionStartFlag;
            sessionObj.PresidentID = PresidentID;
            return sessionObj;
        }
    }
}
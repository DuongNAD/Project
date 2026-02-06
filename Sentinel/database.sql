create database CyberSentinelDB
use CyberSentinelDB

create table SystemAdmins(
	AdminID int primary key not null identity,
	Username varchar(50) not null,
	PasswordHash nvarchar(225) not null,
	Role nvarchar(20) not null default 'NORMAL_ADMIN' 
		check (Role in ('NORMAL_ADMIN','SUPER_ADMIN')),
	CreateAt datetime default getdate()
);

create table Customers(
	CustomerID int  identity(1,1) not null primary key,
	Email nvarchar(100) not null Unique,
	PasswordHash nvarchar(255) not null ,
	ApiKey nvarchar(64) unique,
	SubscriptionPlan nvarchar(20) not null default 'FREE'
		check (SubscriptionPlan in ('FREE','PRO')),
	CreatedAt datetime default getdate()
);

create table SecuritySolutions(
	SolutionID int identity(1,1) not null primary key,
	SolutionName nvarchar(100) not null,
	ActionStep nvarchar(max) not null
);

create table MonitoredSites (
	SiteID int identity(1,1) primary key not null,
	DomainURL nvarchar(255) unique,
	CustomerID int not null,
	ServerIP nvarchar(50) 
);

create table GlobalThreatIntel (
	ThreatID int identity(1,1) not null primary key,
	Pattern nvarchar(255) unique not null,
	ThreatType NVARCHAR(50) not null,
		CHECK (ThreatType IN (
            'SQL_INJECTION', 
            'XSS', 
            'CSRF', 
            'SSRF', 
            'IDOR', 
            'PATH_TRAVERSAL', 
            'BRUTE_FORCE', 
            'DDOS', 
            'RCE', 
            'MAN_IN_THE_MIDDLE', 
            'BOT_TRAFFIC', 
            'MALWARE', 
            'OTHER'
        )),
	RiskLevel nvarchar(20) not null default 'LOW'
		check (RiskLevel in ('LOW','MEDIUM','HIGH','CRITICAL')),
	SolutionID int 
);